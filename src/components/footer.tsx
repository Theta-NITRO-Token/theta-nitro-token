import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './../styles/Footer.module.css'

export default function Footer() {
    return (
        <footer className={`text-center py-4 ${styles.footer}`}>
            <div className="container">
                <div className="row row-cols-1 row-cols-lg-2">
                    <div className="col">
                        <p className="my-2">Copyright&nbsp;© 2024 NITRO.MEME</p>
                    </div>
                    <div className="col">
                        <ul className="list-inline my-2">
                            <li className="list-inline-item me-4">
                                <a href="https://twitter.com/ThetaNitroToken">
                                    <div className={`bs-icon-circle bs-icon-primary bs-icon ${styles.iconCircle}`}>
                                        <svg className="bi bi-twitter-x" fill="currentColor" height="1em"
                                             viewBox="0 0 16 16"
                                             width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"></path>
                                        </svg>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}