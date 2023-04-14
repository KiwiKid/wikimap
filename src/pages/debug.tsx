import { type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";

const Debug:NextPage = () => {

    const data = api.latLng.getAll.useQuery({
        page: 1,
        length: 50
    }, {
        staleTime: Infinity
    })

    const tableHeadClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    const tableDataClass = "px-6 py-4 whitespace-nowrap"

    return (
        <div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={tableHeadClass}>
                                ID
                                </th>
                                <th scope="col" className={tableHeadClass}>
                                Lat
                                </th>
                                <th scope="col" className={tableHeadClass}>
                                Lng
                                </th>
                                <th scope="col" className={tableHeadClass}>
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {data?.isFetched ? data.data?.map((d) => (
                                <tr key={d.id}>
                                    <td className={tableDataClass}>
                                        <div className="text-sm font-medium text-gray-900">{d.id}</div>
                                    </td>
                                    <td className={tableDataClass}>
                                        <div className="text-sm text-gray-500">{d.lat}</div>
                                    </td>
                                    <td className={tableDataClass}>
                                        <div className="text-sm text-gray-500">{d.lng}</div>
                                    </td>
                                    <td className={tableDataClass}>
                                        <div className="text-sm text-gray-500"><Link href={`/debug/process?id=${d.id}`}>Process</Link></div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                <td className={tableDataClass} colSpan={3}>Not fetched</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

        </div>
    )
}


export default Debug;