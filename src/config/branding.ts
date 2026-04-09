export const BRAND_CONFIG = {
    company: {
        name: "Company FinOps",
        subtitle: "ML Attribution System",
        logoText: "FO",
        logoSrc: null,
    },
    persistant: {
        name: "Persistant FinOps",
        subtitle: "ML Attribution System",
        logoText: null,
        logoSrc: "/Persistant Logo.png",
    },
    cogniify: {
        name: "Cogniify FinOps",
        subtitle: "ML Attribution System",
        logoText: null,
        logoSrc: "/Cogniify Logo.png",
    }
};

export const getBrand = () => {
    const brandKey = (process.env.NEXT_PUBLIC_BRAND || "company").toLowerCase();
    return (BRAND_CONFIG as any)[brandKey] || BRAND_CONFIG.company;
};
