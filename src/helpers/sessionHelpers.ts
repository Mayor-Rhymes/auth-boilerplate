


export const checkIfSessionExpired = (expirationNumber: number) => {

    const sessionExpirationDate = new Date(expirationNumber * 1000);
    const today = new Date();
    return today > sessionExpirationDate;
}

// console.log(checkIfSessionExpired(1753797948));