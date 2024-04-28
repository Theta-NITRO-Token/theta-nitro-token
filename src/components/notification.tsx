import styles from "@/styles/Notification.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useGlobalState} from "@/hooks/globalState";
import {useEffect, useState} from "react";

export default function Notification() {
    const [showNotification, setShowNotification] = useGlobalState('notification')
    const [transition, setTransition] = useState(false)

    useEffect(() => {
        if(showNotification.show) {
            setTimeout(() => {
                setTransition(true)
            }, 100);
            setTimeout(() => {
                setTransition(false)
            }, 2400);
        }
    }, [showNotification.show]);
    return (
        <>{showNotification.show ?
            <div className={`${styles.outerContainer} ${transition ? styles.active : ''}`}>
                <div className={`${styles.notification}`}>
                    <span>{showNotification.message}</span>
                </div>
                <div
                    className={`${styles.statusLine} ${showNotification.isSuccess ? styles.success : styles.error}`}></div>
            </div> : ''}
        </>

    );
};