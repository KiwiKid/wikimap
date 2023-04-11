import Link from 'next/link';

export default function NavBar() {
  return (
    <div>
      <Link href="/debug/init-latlng">
        Init
      </Link> »»»  
      <Link href="/debug/list-latlng">
        List
      </Link> »»»  
      <Link
        href="/debug/place"
      >Place</Link>
      
    </div>
  );
}