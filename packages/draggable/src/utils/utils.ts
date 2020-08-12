export const int = (a: string) => Number.parseInt(a, 10)
export const isNum = (num: any) => typeof num === 'number' && !Number.isNaN(num)
