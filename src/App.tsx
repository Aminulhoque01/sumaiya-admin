 
import { BrowserRouter } from "react-router-dom";

import ReduxProvider from "./redux/provider";
import Router from "./app/router";
 

function App() {
  return (
    <ReduxProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ReduxProvider>
  );
}

export default App;
 
