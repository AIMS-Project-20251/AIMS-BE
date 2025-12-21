export interface ProductsStrategy {
    findAll(search?: string, category?: string);
    findOne(id: number);
    create(dto: any);
    update(id: number, dto: any);
    remove(id: number);
}
