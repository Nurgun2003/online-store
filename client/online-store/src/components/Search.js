import { useSearchParams } from "react-router-dom"
import Products from "../Collection";

export default function Search() {
    const searchParams = useSearchParams()[0];
    const text = searchParams.get("text");
    return <>
        <h1>Результаты поиска «{text}»</h1>
        <Products text={text} />
    </>;
}