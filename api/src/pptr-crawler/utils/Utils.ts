export const sleep = async (second: number): Promise<void> => new Promise(resolve => setTimeout(resolve, second * 1000));
export const currentDateTime = (): string => {
    const date = new Date();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}