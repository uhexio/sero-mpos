import React from 'react';
import { HashRouter as Router,Switch, Route } from 'react-router-dom';
import PoolList from './pages/PoolList';
import Stake from "./pages/Stake";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import service from "./service/service";
import My from "./pages/My";
// @ts-ignore

class App extends React.Component<any, any>{

  componentDidMount(): void {

    service.initApp().then(rest=>{

    }).catch(()=>{

    })
  }

  render(): React.ReactNode {
    return (
        <Router>
          <Route path="/node/stake/:id" component={Stake} exact={true} />
          <Route path="/node/list" component={PoolList} exact={true} />
          <Route path="/statistics" component={My} exact={true} />
          <Route path="/" component={PoolList} exact={true} />
        </Router>
    );
  }
}

export default App;
