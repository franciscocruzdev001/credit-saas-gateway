export interface Roles {
    createdAt?:  Date;
    name:        string;
    permissions: string[];
    updatedAt?:  Date;
    [property: string]: any;
}
