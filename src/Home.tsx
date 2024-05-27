import { Link } from "react-router-dom"

export const Home = () => {
    return (
        <div>
            <div>Home</div>
            <Link to="/about">go to about</Link>
        </div>
    )
}