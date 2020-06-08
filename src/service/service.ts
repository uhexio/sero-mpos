import axios from 'axios'
import BigNumber from "bignumber.js";
// @ts-ignore
import seropp from 'sero-pp'

export interface Tx {
    from:string
    mainPKr:string
    value:BigNumber
    poolId?:string
}
class Service {

    id: number

    constructor() {
        this.id = 0;
    }

    async jsonRpc(method: string, args: any) {
        const data: any = {
            id: this.id++,
            method: method,
            params: args
        }
        const host = localStorage.getItem("rpcHost");
        return new Promise((resolve, reject) => {
            if(!host){
                reject(new Error("rpc host required!"))
            }else{
                axios.post(host, data).then((resp: any) => {
                    if(resp.data && resp.data.error){
                        reject(new Error(resp.data.error.message))
                    }else if(resp.data && resp.data.result){
                        resolve(resp.data.result)
                    }
                }).catch(e => {
                    reject(e)
                })
            }
        })
    }

    async commitTx(tx:Tx){
        await this.initApp()
        return new Promise<any>((resolve, reject) => {
            let executeData = {
                from: tx.from,
                value: "0x" + tx.value.toString(16),
                gasPrice: '0x' + new BigNumber('1000000000').toString(16),
                cy: "SERO",
                gas:'0x' + new BigNumber('25000').toString(16),
                BuyShare: {
                    Vote: tx.mainPKr,
                    Value: '0x' + tx.value.toString(16),
                    Pool: tx.poolId
                }
            }
            seropp.executeContract(executeData, function (rest:any,err:any) {
                if(err){
                    reject(err)
                }else{
                    resolve(rest)
                }
            })
        })
    }

    async initApp(){
        return new Promise(resolve=>{
            const dapp = {
                name: "MPoS",
                contractAddress: "SERO Staking of mobile",
                github: "https://github.com/sero-cash/sero-pp/example",
                author: "TIM",
                url: "http://192.168.50.86:3000",
                logo: "http://192.168.50.86:3000/assets/icon/icon.png",
            }

            seropp.init(dapp,function (rest:any) {
                console.log("init result >>> " , rest);

                seropp.getInfo(function (data:any) {
                    if(data){
                        localStorage.setItem("language",data.language);
                        localStorage.setItem("rpcHost",data.rpc)
                    }
                    resolve()
                })
            })
        })
    }

    async getAccounts(){
        await this.initApp()
        return new Promise((resolve,reject) => {
            seropp.getAccountList((data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

    async getAccount(pk:string){
        await this.initApp()

        return new Promise((resolve,reject) => {
            seropp.getAccountDetail(pk,(data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

}

const service:Service = new Service()
export default service