import styles from "@/styles/Navbar.module.css";
import {useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/router';
import Link from "next/link";
import Image from "next/image";


export default function Navbar() {

    const router = useRouter();
    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

    const currentRoute = router.pathname;
    const { referralId } = router.query;
    const handleClick = (route: string) => {
        // Navigate to the about page
        let href = `/${route}`;
        if(referralId) {
            href += `?referralId=${referralId}`
        }
        router.push(href);
    };


    const closeAll = () => {
        setIsConnectHighlighted(false);
    };

    return (
        <nav className={`navbar navbar-expand-md py-3 ${styles.navbar}`}>
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" onClick={() => handleClick('')}>
                    <span
                        className="bs-icon-sm bs-icon-rounded bs-icon-semi-white d-flex justify-content-center align-items-center me-2 bs-icon">
                    <Image src="/nitro_token.png" alt="TFuel Token"
                           width={45} height={45}/>
                </span>
                    <span className={styles.brand}>NITRO</span>
                </a>
                <button className="navbar-toggler" data-bs-target="#navcol-1" data-bs-toggle="collapse"><span
                    className="visually-hidden">Toggle navigation</span><span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navcol-1">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className={`nav-link ${currentRoute == '/nft' ? styles.highlightSelected : styles.highlight}`} onClick={() => handleClick('nft')}>NFTs</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${currentRoute == '/referral' ? styles.highlightSelected : styles.highlight}`}  onClick={() => handleClick('referral')}>ReferralProgram</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${currentRoute == '/whitepaper' ? styles.highlightSelected : styles.highlight}`} onClick={() => handleClick('whitepaper')}>WhitePaper</a>
                        </li>
                    </ul>
                    <div
                        onClick={closeAll}
                    >
                        <w3m-button balance={'hide'} size={'md'}/>
                    </div>
                </div>
            </div>
        </nav>
    )
}