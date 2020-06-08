import * as React from 'react'
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonNote,
    IonGrid, IonRow, IonCol, IonText

} from "@ionic/react";

import {Pool} from '../types/types'
import utils from '../common/utils'
import BigNumber from "bignumber.js";
interface PoolInfoParams {
    pool:Pool
    onView:(p:Pool)=>void
    onStaking:(p:Pool)=>void
}

const PoolInfo:React.FC<PoolInfoParams> = ({pool,onView,onStaking})=>{

    const choiceNum = new BigNumber(pool.choicedNum);
    const missed = new BigNumber(pool.missedNum);
    const wishVoteNum = new BigNumber(pool.wishVoteNum);
    const nodeVoted = choiceNum.minus(missed);
    let missRate = "--";
    if (nodeVoted.comparedTo(0)>0){
        missRate = wishVoteNum.dividedBy(nodeVoted).multipliedBy(100).toFixed(2);
    }
    const state = pool.closed?<IonText color={"danger"}>Close</IonText>:<IonText color={"success"}>Normal</IonText>;

    return (
        <div>
            <IonCard>
                <IonCardHeader>
                    <IonCardSubtitle><span style={{textTransform:'lowercase'}}>{utils.ellipsis(pool.id)}</span></IonCardSubtitle>
                    <IonCardTitle>{utils.convertPoolName(pool.id)}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonGrid>
                        <IonRow>
                            <IonCol>Shares<br/><IonNote color={"tertiary"}>{utils.hexToString(pool.shareNum)}</IonNote></IonCol>
                            <IonCol>Fee<br/><IonNote color={"tertiary"}>{utils.fromValue(pool.fee,2).toString(10)} %</IonNote></IonCol>
                            <IonCol>Miss <br/><IonNote color={"warning"}>{missRate}%</IonNote></IonCol>
                            <IonCol>State <br/><IonNote>{state}</IonNote></IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
                <IonItem lines={"none"}>
                    <IonButton fill="outline" slot="end" onClick={()=>onView(pool)}>View</IonButton>
                    {pool.closed?"":<IonButton slot="end" onClick={()=>onStaking(pool)}>Staking</IonButton>}
                </IonItem>
            </IonCard>
        </div>
    )
}

export default PoolInfo