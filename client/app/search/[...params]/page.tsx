import SearchPage from "../../components/SearchPage/SearchPage";

interface PageProps {
  params: {
    params: string[];
  };
}

export default async function SearchDynamic({ params }: PageProps) {
  const { params: urlParams } = await params;

  if (!urlParams || urlParams.length === 0) {
    return <SearchPage />;
  }

  const [firstParam, secondParam] = urlParams;

  if (firstParam.match(/^\d+$/)) {
    return <SearchPage page={firstParam} />;
  }

  if (secondParam && secondParam.match(/^\d+$/)) {
    return <SearchPage category={firstParam} page={secondParam} />;
  }

  return <SearchPage category={firstParam} />;
}
