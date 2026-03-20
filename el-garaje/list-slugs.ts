import { ProductRepository } from './src/infrastructure/repositories/product.repo';
import { toProduct } from './src/domain/product/product.mapper';

async function main() {
    const products = await ProductRepository.findAll({ limit: 5 });
    console.log(JSON.stringify(products.map(p => ({ title: p.title, slug: p.slug })), null, 2));
}

main().catch(console.error);
