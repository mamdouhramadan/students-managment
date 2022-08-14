import React from 'react'
import './loading.css';
import Lottie from 'react-lottie';
import * as animationData from '../../assets/animations/loading.json';

const LoadingSpinner = () => {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
       
    };

    return (
        <div className="loading-spinner">
            <Lottie
                options={defaultOptions}
                height={200}
                width={200}
            />

           
        </div>
    )
}

export default LoadingSpinner