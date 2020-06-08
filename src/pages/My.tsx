import * as React from 'react'
import service from "../service/service";
import {
    IonItem, IonItemDivider,
    IonLabel,
    IonList,
    IonNote, IonSelect, IonSelectOption,
    IonText,
} from '@ionic/react'
import utils from "../common/utils";

interface State {
    statics:any
    selectAccount:any
    accounts?:any
}

class My extends React.Component<any, State>{

    state:State = {
        statics:null,
        selectAccount:{},
        accounts:[]
    }

    componentDidMount(): void {

        this.getAccounts().catch(e=>{

            console.log(e)
        });
    }

    async getStakeByPKr(pkr:string){
        const that = this;
        const rest:any = await service.jsonRpc("stake_getShareByPkr",[pkr]);
        that.setState({
            statics:rest
        })
    }

    async getAccounts(){
        const that = this;
        const rest:any = await service.getAccounts();
        that.setState({
            accounts:rest
        })
        const selectAccountPK = localStorage.getItem("selectAccountPK");
        if(selectAccountPK){
            for(let act of rest){
                if(act.PK === selectAccountPK){
                    that.setState({
                        selectAccount: act
                    })
                    await that.getStakeByPKr(act.MainPKr)
                }
            }
        }else{
            if(rest[0]){
                that.setState({
                    selectAccount:rest[0]
                })
                await that.getStakeByPKr(rest[0].MainPKr)
            }
        }

    }

    setAccount = (pk:any)=>{
        const that = this;
        service.getAccount(pk).then((rest:any)=>{
            if(rest && rest.MainPKr){
                that.setState({
                    selectAccount:rest
                })
                that.getStakeByPKr(rest.MainPKr).catch()

                localStorage.setItem("selectAccountPK",rest.PK)
            }
        })
    }

    renderAccountsOp=(accounts:any)=>{
        let ops = [];
        if(accounts && accounts.length>0){
            for(let i=0;i<accounts.length;i++){
                const act = accounts[i];
                ops.push(<IonSelectOption value={act.PK}>{act.Name}({act.MainPKr})</IonSelectOption>)
            }
        }
        return ops
    }

    getBalance=(balance:any,cy:string)=>{
        if(balance && balance.has(cy)){
            return utils.fromValue(balance.get(cy),18).toString(10)
        }
        return "0"
    }

    renderData = ()=>{
        const {statics} = this.state;

        let data:any = {};
        if(statics && statics.length>0){
            data = statics[0];
        }
        return <IonList>
            <IonItemDivider>Staking Detail</IonItemDivider>
            <IonItem>
                <IonLabel>Remaining</IonLabel>
                <IonNote slot={"end"} color={"primary"}>{utils.hexToString(data.remaining)}</IonNote>
            </IonItem>

            <IonItem>
                <IonLabel>Expired</IonLabel>
                <IonNote slot={"end"} color={"medium"}>{utils.hexToString(data.expired)}</IonNote>
            </IonItem>
            <IonItem>
                <IonLabel>Missed</IonLabel>
                <IonNote slot={"end"} color={"danger"}>{utils.hexToString(data.missed)}</IonNote>
            </IonItem>
            <IonItem>
                <IonLabel>Total</IonLabel>
                <IonNote slot={"end"} color={"success"}>{utils.hexToString(data.total)}</IonNote>
            </IonItem>

            <IonItem>
                <IonLabel>ShareIds Count</IonLabel>
                <IonNote slot={"end"} color={"tertiary"}>{utils.hexToString(data.shareIds?data.shareIds.length:0)}</IonNote>
            </IonItem>
            <IonItem>
                <IonLabel>Staking in Pools</IonLabel>
                <IonNote slot={"end"} color={"tertiary"}>{data.pools?data.pools.length:0}</IonNote>
            </IonItem>
            <IonItem>
                <IonLabel>Total Amount</IonLabel>
                <IonNote slot={"end"} color={"secondary"}>{utils.fromValue(data.totalAmount,18).toString(10)} SERO</IonNote>
            </IonItem>
            <IonItem>
                <IonLabel>Profit</IonLabel>
                <IonNote slot={"end"} color={"secondary"}>{utils.fromValue(data.profit,18).toString(10)} SERO</IonNote>
            </IonItem>
        </IonList>
    }

    render(): React.ReactNode {
        const {selectAccount,accounts} = this.state;
        const renderData = this.renderData();
        const options = this.renderAccountsOp(accounts);
        return <div>
            <IonList>
                <IonItemDivider>Select Account</IonItemDivider>
                <IonItem>
                    <IonLabel>Accounts</IonLabel>
                    <IonSelect value={selectAccount.PK} placeholder="Select One" onIonChange={e => this.setAccount(e.detail.value)}>
                        {options}
                    </IonSelect>
                </IonItem>
                <IonItem lines={"none"}>
                    <IonLabel>Balance</IonLabel>
                    <IonText color={"secondary"}>{this.getBalance(selectAccount.Balance,"SERO")} SERO</IonText>
                </IonItem>
                {renderData}
            </IonList>

        </div>;
    }
}

export default My