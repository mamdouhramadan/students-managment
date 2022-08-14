import LandingPage from "./pages/LandingPage";
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from "react";
import userStore from "./flux/UserStore";
import SelectYourRole from "./components/SelectYourRole";
import LoadingSpinner from "./components/LoadingSpinner";
import studentStore from "./flux/StudentStore";

const App = () => {

  const [currentRole, setCurrentRole] = useState(userStore.currentRole);
  const [loading, setLoading] = useState(studentStore.loading);

  useEffect(() => {
    userStore.on('change', () => {
      setCurrentRole(userStore.currentRole);
    })
    studentStore.on('change', () => {
      setLoading(studentStore.loading);
    })
  }, [])

  return (
    <div className="App">

      {
        !currentRole ?
          <SelectYourRole />
          :
          <>
            {loading && <LoadingSpinner />}
            <LandingPage />
          </>
      }
      <ToastContainer />

    </div>
  );
}

export default App;
