/**
 * Product Image Upload Client Module
 * 
 * Shared client-side logic for image preview and compression.
 * Used by create and edit product forms.
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.85;

/**
 * Compress an image file to WebP format.
 * Falls back to original file on error.
 */
export async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('No canvas context'));
                return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Compression produced no data'));
                    }
                },
                'image/webp',
                QUALITY
            );
        };
        
        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };
        
        img.src = objectUrl;
    });
}

/**
 * Create preview thumbnails for selected files.
 */
export function createImagePreviews(
    files: FileList | File[],
    container: HTMLElement | null,
    onComplete?: (fileCount: number) => void
): void {
    if (!container) return;
    
    container.innerHTML = '';
    
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) {
        onComplete?.(0);
        return;
    }
    
    fileArray.forEach((file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const url = e.target?.result as string;
            const div = document.createElement('div');
            div.className = 'aspect-square rounded border border-primary/20 bg-background-dark overflow-hidden';
            div.innerHTML = `<img src="${url}" class="w-full h-full object-cover opacity-80" alt="Preview" />`;
            container.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
    
    onComplete?.(fileArray.length);
}

/**
 * Compress and prepare files for upload.
 * Returns DataTransfer with compressed WebP files.
 */
export async function prepareFilesForUpload(
    files: FileList | File[],
    onProgress?: (stage: string) => void
): Promise<DataTransfer> {
    const dt = new DataTransfer();
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
            dt.items.add(file);
            continue;
        }
        
        try {
            onProgress?.(`Optimizing ${file.name}...`);
            const blob = await compressImage(file);
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const newFile = new File([blob], cleanName, { type: 'image/webp' });
            dt.items.add(newFile);
        } catch (err) {
            console.error(`Compression failed for ${file.name}:`, err);
            dt.items.add(file); // Fallback to original
        }
    }
    
    return dt;
}

/**
 * Initialize image upload handling for a form.
 * Handles preview, compression, and loading states.
 */
export function initImageUpload(options: {
    formSelector: string;
    inputSelector: string;
    previewSelector: string;
    buttonSelector: string;
    loadingText: string;
    compressingText: string;
    onCompressStart?: () => void;
    onCompressComplete?: () => void;
}): () => void {
    const {
        formSelector,
        inputSelector,
        previewSelector,
        buttonSelector,
        loadingText,
        compressingText,
        onCompressStart,
        onCompressComplete,
    } = options;
    
    // Store bound handlers so we can remove them later
    const handlers: {
        change: ((e: Event) => void) | null;
        submit: ((e: Event) => void) | null;
    } = { change: null, submit: null };
    
    function init() {
        const form = document.querySelector<HTMLFormElement>(formSelector);
        const imageInput = document.querySelector<HTMLInputElement>(inputSelector);
        const previewContainer = document.querySelector<HTMLElement>(previewSelector);
        const btn = document.querySelector<HTMLButtonElement>(buttonSelector);
        
        if (!form || !imageInput || !btn) return;
        
        // Remove any existing handlers to prevent duplicates
        if (handlers.change) {
            imageInput.removeEventListener('change', handlers.change);
        }
        if (handlers.submit) {
            form.removeEventListener('submit', handlers.submit);
        }
        
        // Preview handler
        handlers.change = (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                createImagePreviews(files, previewContainer);
            }
        };
        imageInput.addEventListener('change', handlers.change);
        
        // Submit handler with compression
        handlers.submit = async (e: Event) => {
            // Skip if already compressed or no files
            if (
                imageInput.dataset.compressed === 'true' ||
                !imageInput.files ||
                imageInput.files.length === 0
            ) {
                btn.innerHTML = loadingText;
                btn.classList.add('opacity-70', 'pointer-events-none');
                return;
            }
            
            e.preventDefault();
            
            btn.innerHTML = compressingText;
            btn.classList.add('opacity-70', 'pointer-events-none');
            onCompressStart?.();
            
            try {
                const dt = await prepareFilesForUpload(imageInput.files);
                
                // Create new FormData - start fresh to avoid issues
                const formData = new FormData();
                
                // Copy all other form fields
                const formDataFromForm = new FormData(form);
                formDataFromForm.forEach((value, key) => {
                    if (key !== 'images') {
                        formData.append(key, value);
                    }
                });
                
                // Add compressed files
                for (let i = 0; i < dt.files.length; i++) {
                    formData.append('images', dt.files[i]);
                }
                
                imageInput.dataset.compressed = 'true';
                onCompressComplete?.();
                
                // Submit form via fetch to avoid event recursion
                btn.innerHTML = loadingText;
                
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    // Fallback: replace current page with response
                    const html = await response.text();
                    document.open();
                    document.write(html);
                    document.close();
                }
            } catch (error) {
                console.error('Compression/submission error:', error);
                imageInput.dataset.compressed = 'true';
                // Fallback: submit without compression
                btn.innerHTML = loadingText;
                form.submit();
            }
        };
        form.addEventListener('submit', handlers.submit);
    }
    
    document.addEventListener('astro:page-load', init);
    init();
    
    return () => {
        document.removeEventListener('astro:page-load', init);
        // Also cleanup the form/input handlers
        const form = document.querySelector<HTMLFormElement>(formSelector);
        const imageInput = document.querySelector<HTMLInputElement>(inputSelector);
        if (handlers.change && imageInput) {
            imageInput.removeEventListener('change', handlers.change);
        }
        if (handlers.submit && form) {
            form.removeEventListener('submit', handlers.submit);
        }
    };
}
