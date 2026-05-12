

import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases from 'react-native-purchases';

const USE_MOCK_PURCHASES = true;

const SubContext = createContext();

export default function SubContextProvider({children}){

    const [isUserPro, setIsUserPro ] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (USE_MOCK_PURCHASES) return;

        async function check() {
            setLoading(true);
            await Purchases.configure({ apiKey: 'test_zdImfIzYAHsffKIzQRlngAuYssa' });
            const customerInfo = await Purchases.getCustomerInfo();
            const pro = customerInfo.entitlements.active['pro'] !== undefined;
            setIsUserPro(pro);
            setLoading(false);
        }
        check();
    }, [])

    // Purchase Pro

    async function purchasePro(){
        if (isUserPro) return { success: true };

        setLoading(true);

        try {
            if (USE_MOCK_PURCHASES) {
                await new Promise(resolve => setTimeout(resolve, 800));
                setIsUserPro(true);
                return { success: true };
            }
        } finally {
            setLoading(false);
        }
    }


    async function restorePurchases(){

        setLoading(true)
        await Purchases.restorePurchases()
        const customerInfo = await Purchases.getCustomerInfo();


        
    }

    // 



    return(


        <SubContext.Provider value={{isUserPro, loading, purchasePro, restorePurchases}}>
            {children}
        </SubContext.Provider>



    );


};  

export function useSub(){
    return useContext(SubContext);
};