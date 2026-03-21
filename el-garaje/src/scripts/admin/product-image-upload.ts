/**
 * Product Image Upload Client Module
 * 
 * Shared client-side logic for image preview and compression.
 * Used by create and edit product forms.
 */

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.5;

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
        
        // Submit handler with compression and individual uploads
        handlers.submit = async (e: Event) => {
            const imageInput = document.querySelector<HTMLInputElement>(inputSelector);
            const btn = document.querySelector<HTMLButtonElement>(buttonSelector);
            const form = document.querySelector<HTMLFormElement>(formSelector);
            
            if (!imageInput || !btn || !form) return;

            // 1. Check browser validation
            if (!form.checkValidity()) {
                return;
            }
            
            // 2. Identify if there are new images to upload
            const hasNewImages = imageInput.files && imageInput.files.length > 0;
            const alreadyProcessed = imageInput.dataset.processed === 'true';

            if (!hasNewImages || alreadyProcessed) {
                // No new images or already handled, standard submission
                btn.innerHTML = loadingText;
                btn.classList.add('opacity-70', 'pointer-events-none');
                return;
            }
            
            // 3. Start the Decoupled Upload Flow
            e.preventDefault();
            
            btn.innerHTML = compressingText;
            btn.classList.add('opacity-70', 'pointer-events-none');
            onCompressStart?.();
            
            try {
                // A. Compress images
                const dt = await prepareFilesForUpload(imageInput.files as FileList);
                const filesToUpload = Array.from(dt.files);
                const storagePaths: string[] = [];

                // B. Upload images individually to avoid payload limits
                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">refresh</span> Subiendo ${i + 1}/${filesToUpload.length}...`;
                    
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    
                    // Try to get productId from current URL if in edit mode
                    const urlParts = window.location.pathname.split('/');
                    const potentialId = urlParts[urlParts.length - 1];
                    if (potentialId && potentialId !== 'nuevo') {
                        uploadFormData.append('productId', potentialId);
                    }

                    const response = await fetch('/api/admin/productos/upload', {
                        method: 'POST',
                        body: uploadFormData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Error al subir la imagen ${i + 1}`);
                    }

                    const data = await response.json();
                    storagePaths.push(data.storagePath);
                }

                // C. Inject the collected paths into the form
                let pathsInput = form.querySelector<HTMLInputElement>('input[name="uploaded_image_paths"]');
                if (!pathsInput) {
                    pathsInput = document.createElement('input');
                    pathsInput.type = 'hidden';
                    pathsInput.name = 'uploaded_image_paths';
                    form.appendChild(pathsInput);
                }
                pathsInput.value = JSON.stringify(storagePaths);

                // D. Flag as processed and submit
                imageInput.dataset.processed = 'true';
                onCompressComplete?.();
                
                btn.innerHTML = loadingText;
                form.submit();
            } catch (error: any) {
                console.error('Decoupled upload error:', error);
                alert(`Error en la subida: ${error.message || 'Error desconocido'}. Por favor, intenta de nuevo.`);
                
                // Reset button state
                btn.innerHTML = 'Reintentar Guardar';
                btn.classList.remove('opacity-70', 'pointer-events-none');
            }
        };
        form.addEventListener('submit', handlers.submit);
    }
    
    init();
    
    return () => {
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
