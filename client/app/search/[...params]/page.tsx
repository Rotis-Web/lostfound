import SearchPage from "../../components/SearchPage/SearchPage";

interface PageProps {
  params: {
    params: string[];
  };
}

export default function SearchDynamic({ params }: PageProps) {
  const { params: urlParams } = params;

  if (!urlParams || urlParams.length === 0) {
    // /search
    return <SearchPage />;
  }

  const [firstParam, secondParam] = urlParams;

  // Check if first param is a page number
  if (firstParam.match(/^\d+$/)) {
    // /search/2
    return <SearchPage page={firstParam} />;
  }

  // Check if second param is a page number
  if (secondParam && secondParam.match(/^\d+$/)) {
    // /search/category/2
    return <SearchPage category={firstParam} page={secondParam} />;
  }

  // Otherwise, first param is a category
  // /search/category
  return <SearchPage category={firstParam} />;
}
