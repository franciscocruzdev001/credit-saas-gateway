import { injectable, unmanaged } from 'inversify';
import { Model, UpdateQuery, AnyObject, QueryOptions, QueryFilter, HydratedDocument } from 'mongoose';
import { IBaseMongoModel } from '../repository/IBaseMongoModel';
import { forkJoin, from, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { merge } from 'lodash';

@injectable()
export abstract class BaseMongoModel<T> implements IBaseMongoModel<T> {
    protected model: Model<T>;

    // Utilizamos @unmanaged() si el modelo lo provee la subclase constructora
    constructor(@unmanaged() model: Model<T>) {
        this.model = model;
    }

    public findAllDocuments(): Observable<{
        documents: T[],
        totalDocuments: number
    }> {
        return of(true).pipe(
            switchMap(() =>
                from(
                    this.model.find().exec()
                )
            ),
            map((documents: T[]) => ({
                documents: documents,
                totalDocuments: documents.length
            }))
        );
    }

    public findDocuments(
        queryfilter: QueryFilter<T>,
        options?: QueryOptions
    ): Observable<{
        documents: T[],
        totalDocuments: number
    }> {
        return of(true).pipe(
            switchMap(() => {
                return forkJoin({
                    documents: from(
                        this.model.
                            find(queryfilter, options).
                            exec()
                    ),
                    totalDocuments: this.model.countDocuments(queryfilter)
                })
            }),
        );
    }

    public findByIdDocument(documentId: string): Observable<T | null> {
        return of(true).pipe(
            mergeMap(() =>
                this.model.findById(documentId).exec()
            )
        );
    }

    public create(document: Partial<T>): Observable<boolean> {
        return of(true).pipe(
            mergeMap(() =>
                this.model.create(document)
            ),
            map((result: HydratedDocument<T>) => {
                return result._id !== null ? true : false;
            })
        );
    }

    public update(
        documentId: string,
        updateFields: UpdateQuery<T>
    ): Observable<boolean> {
        return of(true).pipe(
            mergeMap(() =>
                this.model.findByIdAndUpdate(documentId, updateFields, { new: true }).exec()
            ),
            map((result: HydratedDocument<T> | null) => {
                return result !== null ? true : false;
            })
        );
    }

    public remove(documentId: string): Observable<boolean> {
        return of(true).pipe(
            mergeMap(() =>
                this.model.findByIdAndDelete(documentId).exec()
            ),
            map((result: HydratedDocument<T> | null) => {
                return result !== null ? true : false;
            })
        );
    }



    /*public findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    public async create(item: AnyObject): Promise<T> {
        return this.model.create(item);
    }

    public async update(id: string, item: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, item, { new: true }).exec();
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }*/
}