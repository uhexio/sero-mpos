import * as React from 'react'
import {
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonText,
    IonItemDivider,
    IonInput,
    IonCol,
    IonButton,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonButtons, IonTabButton, IonIcon, IonTabBar,IonToast
} from "@ionic/react";
import utils from "../common/utils";
import BigNumber from "bignumber.js";
import {Pool} from "../types/types";
import service from "../service/service";
import i18n from "../i18n";

interface State {
    data?:any
    share?:number|string
    amount?:string
    price?:string
    accounts?:any
    selectAccount?:any
    toastMsg?:string
    showToast:boolean
}

class Stake extends React.Component<any, State>{

    state: State = {
        data:null,
        share:0,
        amount:"0",
        price:"0",
        selectAccount:{},
        accounts:[],
        showToast:false
    }

    componentDidMount(): void {

        const tdard:any = localStorage.getItem("themeDark");
        let isDark = false;
        if(tdard === true || tdard === "true"){
            isDark = true;
        }
        document.body.classList.toggle('dark', isDark);

        const id = this.props.match.params.id;
        this.loadData(id);

        this.getAccounts();
    }

    loadData = (id:string)=>{
        const that = this;
        service.jsonRpc("stake_poolState",[id]).then((rest=>{
            that.setState({
                data:rest
            })
        }))
    }

    getAccounts(){
        const that = this;
        service.getAccounts().then((rest:any)=>{
            const selectAccountPK = localStorage.getItem("selectAccountPK");
            if(selectAccountPK){
                for(let act of rest){
                    if(act.PK === selectAccountPK){
                        that.setState({
                            selectAccount: act
                        })
                    }
                }
            }else{
                if(rest[0]){
                    that.setState({
                        selectAccount:rest[0]
                    })
                }
            }
            that.setState({
                accounts:rest,
            })
        })
    }

    renderInfo = (data:Pool)=>{
        if(!data){
            return null
        }
        return <div>
            <IonList>
                 <IonItem mode="ios">
                    <IonLabel className="ion-text-wrap">
                        <IonText color={"secondary"} style={{fontWeight:'600'}}>{utils.convertPoolName(data.id)}</IonText>
                        <p/>
                        <IonText color={"dark"}>{data.id}</IonText>
                    </IonLabel>
                </IonItem>
                <IonItem lines={"none"}>
                    <IonLabel mode="ios">{i18n.t("fee")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.fromValue(data.fee,2).toString(10)}%</IonNote>
                </IonItem>
            </IonList>
        </div>
    }

    setAmount(amount:any){
        if(!amount || amount <=0){
            amount = 1;
        }
        console.log("amount>>>",amount);

        const that = this;
        const {selectAccount} = this.state;
        const params:any = {}
        params.from = selectAccount.PK;
        params.vote = selectAccount.MainPKr;
        params.value = "0x"+utils.toValue(amount,18).toString(16);

        service.jsonRpc("stake_estimateShares",[params]).then((rest:any)=>{
            that.setState({
                price: utils.fromValue(new BigNumber(rest.basePrice),18).toFixed(5),
                share:utils.hexToString(rest.total),
                amount:amount
            })
        });
    }

    buyShare(){
        const that = this;
        const {data,amount,share,selectAccount} = this.state;
        if( !amount  || share === 0 || share === "0" ){
            this.toast(i18n.t("tip1"))
            return
        }
        service.jsonRpc("stake_sharePrice",[]).then((price:any)=>{
            // @ts-ignore
            const amountTa = utils.toValue(amount,18)
            const balance = selectAccount.Balance.get("SERO");
            if (!balance || new BigNumber(balance).comparedTo(amountTa)<0){
                that.toast(i18n.t("tip2"))
            }else{
                service.commitTx({
                    from:selectAccount.PK,
                    mainPKr:selectAccount.MainPKr,
                    value:amountTa,
                    poolId:data.id,
                }).then(rest=>{
                    console.log("commitTx>>>",rest)
                }).catch(e=>{
                    console.error("commitTx>>>",e)
                })
            }
        })
    }

    toast=(msg:string)=>{
        this.setState({
            showToast:true,
            toastMsg:msg
        })
    }

    hideToast=()=>{
        this.setState({
            showToast:false,
            toastMsg:''
        })
    }

    setAccount = (pk:any)=>{
        const that = this;
        service.getAccount(pk).then((rest:any)=>{
            that.setState({
                selectAccount:rest
            })
            localStorage.setItem("selectAccountPK",pk);
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
            return utils.fromValue(balance.get(cy),18).toFixed(6)
        }
        return "0"
    }

    render(): React.ReactNode {

        const {data,share,amount,price,selectAccount,accounts,showToast,toastMsg} = this.state;
        const info = this.renderInfo(data);
        const options = this.renderAccountsOp(accounts);


        return (
            <div >
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="#/" />
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonList style={{maxHeight:document.documentElement.clientHeight,height:'auto',overflowY:'scroll',background:"#fff",paddingBottom: '150px'}}>
                    <IonItemDivider mode="ios">Node Info</IonItemDivider>
                    {info}
                    <IonItemDivider mode="ios">{i18n.t("buyShare")}</IonItemDivider>
                     <IonItem mode="ios">
                        <IonLabel mode="ios">{i18n.t("amount")}</IonLabel>
                        <IonNote mode="ios" slot={"end"}>
                            <IonInput type="number" value={amount} autofocus={true} placeholder="Enter Number" clearInput={true} inputMode={"decimal"} color={"dark"} debounce={4} onIonChange={e => this.setAmount(parseInt(e.detail.value!, 10))}/>
                        </IonNote>
                    </IonItem>
                     <IonItem mode="ios">
                        <IonLabel mode="ios">{i18n.t("price")}</IonLabel>
                        <IonNote mode="ios" slot={"end"} color={"tertiary"}>{price} SERO</IonNote>
                    </IonItem>
                    <IonItem lines={"none"}>
                        <IonLabel mode="ios">{i18n.t("shares")}</IonLabel>
                        <IonNote mode="ios" slot={"end"} color={"tertiary"}>{share}</IonNote>
                    </IonItem>

                    <IonItemDivider mode="ios">{i18n.t("selectAccount")}</IonItemDivider>
                     <IonItem mode="ios">
                        <IonLabel mode="ios">{i18n.t("accounts")}</IonLabel>
                        <IonSelect value={selectAccount.PK} placeholder="Select One" onIonChange={e => this.setAccount(e.detail.value)}>
                            {options}
                        </IonSelect>
                    </IonItem>
                     <IonItem mode="ios">
                        <IonLabel mode="ios">{i18n.t("balance")}</IonLabel>
                        <IonText color={"success"}>{this.getBalance(selectAccount.Balance,"SERO")} SERO</IonText>
                    </IonItem>
                </IonList>

                <div style={{position:'fixed',width:"100%",bottom:"0"}}>
                    <IonRow>
                        <IonCol>
                            <IonButton onClick={() => this.buyShare()} expand={"block"} >{i18n.t("commit")}</IonButton>
                        </IonCol>
                    </IonRow>
                </div>

                <IonToast
                    onDidDismiss={this.hideToast}
                    isOpen={showToast}
                    message={toastMsg}
                    duration={2000}
                    color={"warning"}
                />
            </div>
        )
    }
}

export default Stake