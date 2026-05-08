

import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases from 'react-native-purchases';


const SubContext = createContext();

export default function SubContextProvider({children}){

    const [isUserPro, setIsUserPro ] = useState(false);
    const [loading, setLoading] = useState(false);

  

    useEffect(() => {
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
        
    }

    // 



    return(


        <SubContext.Provider value={{isUserPro, loading}}>
            {children}
        </SubContext.Provider>



    );


};  

export function useSub(){
    return useContext(SubContext);
};