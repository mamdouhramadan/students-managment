import React from 'react'
import Lottie from 'react-lottie';
import ServerError from './../../Assets/animations/server-error.json'

const LottieAnimation = () => {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: ServerError,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Lottie options={defaultOptions}
            height={400}
            width={400}
            isStopped={this.state.isStopped}
            isPaused={this.state.isPaused} />
    )
}

export default LottieAnimation