export const normalizeLocation = value => {
    if (typeof value !== 'string') {
        return null;
    }

    const location = value.trim();

    return location && /^[a-zA-Zа-яёА-ЯЁ\s,.-]+$/.test(location)
        ? location
        : null;
};
