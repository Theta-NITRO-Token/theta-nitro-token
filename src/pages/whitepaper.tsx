// pages/whitepaper.tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TextBoxes from "@/components/textBoxes";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './../styles/Whitepaper.module.css'

const TEXT_ROW1 = [
    {
        title: '1. TFuel Backing',
        text: 'Each Theta Nitro Token is backed by a certain amount of TFuel. This amount can only increase but never decrease!',
        marginTop: '0',
    },
    {
        title: '2. Fees benefit holders',
        text: `NITRO implements different types of fees: NFT Marketplace Creator Fee (10%) \nTransfer Fee (2%)\nMinting Fee (1%-5%)\nEach fee benefits all holder as they increase the TFuel backing!`,
        marginTop: '120px',
    }
]

const TEXT_ROW2 = [
    {
        title: '3. Security',
        text: `This is one of the most important factors as we want to provide the best security possible, our Theta Nitro Token contract is not only public but also externally audited!`,
        marginTop: '-50px',
    },
    {
        title: '4. V2 Contract',
        text: `The NITRO V2 Contract will elevate the utility of the token to new heights, as now the TFuel locked in the smart contract will generate a more consistent growth`,
        marginTop: '70px',
    }
]
const WhitepaperPage = () => {
    return <>
        <Navbar/>
        <section className={styles.section}>
            <h1 className={styles.title}>
                White Paper</h1>
            <div className={`d-flex justify-content-center ${styles.buttonContainer}`}>
                <button className={`btn btn-primary ${styles.button}`} type="button">
                    Download
                </button>
            </div>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Key Facts</h1>
                <TextBoxes information={TEXT_ROW1}/>
                <TextBoxes information={TEXT_ROW2}/>
            </div>
        </section>
        <Footer/>
    </>
        ;
};

export default WhitepaperPage;