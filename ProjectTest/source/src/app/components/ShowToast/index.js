import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShowToast = (type = "success", msg, autoClose = 2000, className = "primaryColor") => {
    if (type === "success") {
        toast.success(msg, {
            autoClose: autoClose === null ? 2000 : autoClose,
            className: className === null ? "primaryColor" : className,
          
        });
    } else if (type === "error") {
        toast.error(msg, {
            autoClose: autoClose === null ? 2000 : autoClose,
            className: className === null ? "dangerColor" : className,
        });
    }
};



export default ShowToast