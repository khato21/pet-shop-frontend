import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const AppToastContainer = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
    />
  );
};

export default AppToastContainer;
