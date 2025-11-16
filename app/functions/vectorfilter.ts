import { RegPagesSearchResponse } from "./vectorsearch"

const getFilename = (path: string): string => {
    const parts = path.split("/");
    return parts[parts.length - 1];
}
const compareFile = (path1: string, path2: string): boolean => {
    //pop __page__
    const filename1 = decodeURIComponent(getFilename(path1).split("_page_")[0]);
    const filename2 = decodeURIComponent(getFilename(path2).split("_page_")[0]);

    return filename1 === filename2;
}


export const vectorFilter = (
    document: string,
    searchResult: RegPagesSearchResponse
) => {
    const filtered = searchResult.value.filter((doc) =>
        !compareFile(doc.filename, document) && doc.content.trim().length < 20000
    );
    // sort and limit to top 30
    filtered.sort((a, b) => b["@search.score"] - a["@search.score"]);
    filtered.splice(50);
    return {
        "@odata.count": filtered.length,
        "@odata.context": searchResult["@odata.context"],
        value: filtered
    }
}
