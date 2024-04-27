// Component.jsx

import styles from './../styles/textBoxes.module.css';

interface TextBoxProps {
    title: string;
    text: string;
    marginTop: string;
}

export default function TextBoxes({ information }: { information: TextBoxProps[] }) {
    return (
        <>
            <div className={styles.container}>
                <div className="container">
                    <div className="row">
                        {textBox(information[0].title, information[0].text, information[0].marginTop)}
                        {textBox(information[1].title, information[1].text, information[1].marginTop)}
                    </div>
                </div>
            </div>
        </>
    );
}

function textBox(title: string, text: string, marginTop: string) {
    return (
        <div className={`${styles.roadmap} col-md-6 d-flex justify-content-center roadmap`} style={{marginTop: marginTop}}>
            <div className={`${styles.roadmapContainer} d-flex flex-column justify-content-center`}>
            <div className="container">
                    <div className="row">
                        <div className="col">
                            <h5 className={styles.heading}>{title}</h5>
                            <p className={styles.paragraph}>{text}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
