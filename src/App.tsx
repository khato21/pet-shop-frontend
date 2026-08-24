import { RouterProvider } from "react-router-dom";

import { router } from "./routes";
import AppToastContainer from "./components/Toast/AppToastContainer";

function App() {
  return (
    <>
      <RouterProvider router={router} />

      <AppToastContainer />
    </>
  );
}

export default App;
