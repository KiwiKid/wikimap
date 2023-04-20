import Link from "next/link";

export default function Home(): JSX.Element {
  return (
    <><div>
          The website combines the power of Wikipedia and ChatGPT to create unique stories about various locations around the world.
          You can explore different areas and discover interesting facts and stories associated with each location.
      </div>
        <div>
              The website works by pulling information from Wikipedia articles related to each location and using ChatGPT to generate stories based on local information
          </div>
          <div>
            Every months the stories reset!
          </div>
          <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={'/oldLegend'}>
            Old Legend</Link>
          <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={'/wizard'}>Wizard</Link>
          <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" href={'/lovecraftian'}>Lovecraft</Link>
    </>
  );
}
