export function validateImageDimensions(file: File, expectedWidth: number, expectedHeight: number) {
    return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width === expectedWidth && img.height === expectedHeight);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
};
