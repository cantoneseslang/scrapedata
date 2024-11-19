'use client'

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Image from 'next/image'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
// import { SortIcon } from '@/components/icons/sort-icon'
import Map from './map'
import AdSpace from './ad-space'

export type ExchangeRate = {
  store: string;
  buyRate: number | null;
  sellRate: number | null;
  url: string;
  updateTime: string;
  type: 'store' | 'bank' | 'creditCard' | 'title';
  originalIndex: number;
  area: string;
  mapUrl: string;
  address: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
};

export type Hotel = {
  englishName: string;
  chineseName: string;
  englishAddress: string;
  chineseAddress: string;
  phoneNumber: string;
  area: string;
  mapUrl: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
};

export default function ExchangeRateHotelViewer() {
  const [activeTab, setActiveTab] = useState('exchange')
  const [activeCurrency, setActiveCurrency] = useState('JPY')
  const [data, setData] = useState<ExchangeRate[]>([])
  const [hotelData, setHotelData] = useState<Hotel[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedStore, setSelectedStore] = useState<ExchangeRate | null>(null)

  const columns: ColumnDef<ExchangeRate>[] = [
    {
      accessorKey: 'store',
      header: '両替所',
      cell: ({ row }) => <div>{row.getValue('store')}</div>,
    },
    {
      accessorKey: 'buyRate',
      header: '買いレート',
      cell: ({ row }) => {
        const value = row.getValue('buyRate')
        return <div className="text-right">{typeof value === 'number' ? value.toFixed(4) : 'N/A'}</div>
      },
    },
    {
      accessorKey: 'sellRate',
      header: '売りレート',
      cell: ({ row }) => {
        const value = row.getValue('sellRate')
        return <div className="text-right">{typeof value === 'number' ? value.toFixed(4) : 'N/A'}</div>
      },
    },
    {
      accessorKey: 'updateTime',
      header: '更新時間',
      cell: ({ row }) => <div>{row.getValue('updateTime')}</div>,
    },
    {
      accessorKey: 'area',
      header: '地域',
      cell: ({ row }) => <div>{row.getValue('area')}</div>,
    },
    {
      accessorKey: 'mapUrl',
      header: '地図URL',
      cell: ({ row }) => {
        const store = row.original
        return (
          <Button
            onClick={() => {
              console.log('Selected store:', store)
              if (store.address) {
                setSelectedStore(store)
              } else {
                console.warn('Store missing address:', store.store)
              }
            }}
            variant="outline"
            className="w-full"
          >
            地図を見る
          </Button>
        )
      },
    },
  ]

  const hotelColumns: ColumnDef<Hotel>[] = [
    {
      accessorKey: 'englishName',
      header: '英語ホテル名',
      cell: ({ row }) => <div>{row.getValue('englishName')}</div>,
    },
    {
      accessorKey: 'chineseName',
      header: '漢字ホテル名',
      cell: ({ row }) => <div>{row.getValue('chineseName')}</div>,
    },
    {
      accessorKey: 'englishAddress',
      header: '英語住所',
      cell: ({ row }) => <div>{row.getValue('englishAddress')}</div>,
    },
    {
      accessorKey: 'chineseAddress',
      header: '漢字住所',
      cell: ({ row }) => <div>{row.getValue('chineseAddress')}</div>,
    },
    {
      accessorKey: 'phoneNumber',
      header: '電話番号',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    },
    {
      accessorKey: 'area',
      header: '地域',
      cell: ({ row }) => <div>{row.getValue('area')}</div>,
    },
    {
      accessorKey: 'mapUrl',
      header: '地図URL',
      cell: ({ row }) => {
        const hotel = row.original
        return (
          <Button
            onClick={() => {
              if (hotel.latitude && hotel.longitude) {
                setSelectedStore({
                  ...hotel,
                  store: hotel.englishName,
                  buyRate: null,
                  sellRate: null,
                  url: '',
                  updateTime: '',
                  type: 'store',
                  originalIndex: 0,
                  mapUrl: hotel.mapUrl,
                  address: hotel.englishAddress,
                })
              }
            }}
            variant="outline"
            className="w-full"
          >
            地図を見る
          </Button>
        )
      },
    },
  ]

  const fetchData = async (baseCurrency: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/getSheetData', {
        params: { baseCurrency },
      })
      const rawData = response.data.data
      console.log('Raw data:', rawData)
      const processedData: ExchangeRate[] = []
      let currentType: 'store' | 'bank' | 'creditCard' = 'store'

      rawData.forEach((item: any, index: number) => {
        if (item.store === '銀行' || item.store === 'クレジットカード') {
          processedData.push({
            store: item.store,
            buyRate: null,
            sellRate: null,
            url: '',
            updateTime: '',
            type: 'title',
            originalIndex: index,
            area: '',
            mapUrl: '',
            address: '',
            latitude: undefined,
            longitude: undefined,
          })
          currentType = item.store === '銀行' ? 'bank' : 'creditCard'
        } else {
          const latitude = item.latitude ? parseFloat(item.latitude) : undefined
          const longitude = item.longitude ? parseFloat(item.longitude) : undefined

          processedData.push({
            ...item,
            type: currentType,
            originalIndex: index,
            latitude,
            longitude,
            address: item.address || '',
          })
        }
      })

      console.log('Processed data:', processedData)
      setData(processedData)

      // Set the first store with valid coordinates as the default selection
      const firstValidStore = processedData.find(store =>
        store.latitude !== undefined && store.longitude !== undefined && store.type === 'store'
      )
      if (firstValidStore) {
        console.log('Setting default store:', firstValidStore)
        setSelectedStore(firstValidStore)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('データの取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const fetchHotelData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/getSheetData', {
        params: { sheet: 'hotel' },
      })
      const rawData = response.data.data
      console.log('Raw hotel data:', rawData)
      const processedData: Hotel[] = rawData.map((item: any) => ({
        englishName: item.englishName,
        chineseName: item.chineseName,
        englishAddress: item.englishAddress,
        chineseAddress: item.chineseAddress,
        phoneNumber: item.phoneNumber,
        area: item.area,
        mapUrl: item.mapUrl,
        latitude: item.latitude ? parseFloat(item.latitude) : undefined,
        longitude: item.longitude ? parseFloat(item.longitude) : undefined,
      }))

      console.log('Processed hotel data:', processedData)
      setHotelData(processedData)
    } catch (err) {
      console.error('Failed to fetch hotel data:', err)
      setError('ホテルデータの取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'exchange') {
      fetchData(activeCurrency)
    } else if (activeTab === 'hotel') {
      fetchHotelData()
    }
  }, [activeTab, activeCurrency])

  const sortedData = useMemo(() => {
    if (activeTab === 'exchange') {
      const bankIndex = data.findIndex(item => item.store === '銀行')
      const storeData = data.slice(0, bankIndex)

      let sortedStoreData = [...storeData]
      if (sorting.length > 0) {
        const { id, desc } = sorting[0]
        sortedStoreData.sort((a, b) => {
          const aValue = a[id as keyof ExchangeRate]
          const bValue = b[id as keyof ExchangeRate]

          if (aValue === null && bValue === null) return 0
          if (aValue === null) return 1
          if (bValue === null) return -1

          if (aValue < bValue) return desc ? 1 : -1
          if (aValue > bValue) return desc ? -1 : 1
          return a.originalIndex - b.originalIndex
        })
      }

      return sortedStoreData
    } else if (activeTab === 'hotel') {
      let sortedHotelData = [...hotelData]
      if (sorting.length > 0) {
        const { id, desc } = sorting[0]
        sortedHotelData.sort((a, b) => {
          const aValue = a[id as keyof Hotel]
          const bValue = b[id as keyof Hotel]

          if (aValue < bValue) return desc ? 1 : -1
          if (aValue > bValue) return desc ? -1 : 1
          return 0
        })
      }

      return sortedHotelData
    }

    return []
  }, [activeTab, data, hotelData, sorting])

  const table = useReactTable({
    data: sortedData,
    columns: activeTab === 'exchange' ? columns : hotelColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleSort = (column: 'buyRate' | 'sellRate' | 'area') => {
    const currentSort = sorting[0]
    if (currentSort?.id === column) {
      setSorting(currentSort.desc ? [] : [{ id: column, desc: true }])
    } else {
      setSorting([{ id: column, desc: false }])
    }
  }

  const currencyPairs = [
    { id: 'JPY', label: '1JPY-HKD', base: 'JPY' },
    { id: 'CNY', label: 'CNY-1HKD', base: 'CNY' },
    { id: 'EUR', label: '1EUR-HKD', base: 'EUR' },
    { id: 'USD', label: '1USD-HKD', base: 'USD' },
  ]

  const tabs = [
    { id: 'exchange', label: '為替レート' },
    { id: 'hotel', label: 'ホテル名' },
    { id: 'street', label: '道の名前' },
    { id: 'tourist', label: '観光地' },
    { id: 'hospital', label: '病院' },
    { id: 'pool', label: 'プール' },
    { id: 'market', label: '市場' },
    { id: 'eggTart', label: 'エッグタルト/茶餐廳' },
    { id: 'roastedMeat', label: '燒味' },
    { id: 'congee', label: 'お粥' },
    { id: 'toilet', label: 'トイレ' },
    { id: 'dimSum', label: '飲茶' },
    { id: 'bar', label: 'バー' },
    { id: 'afternoonTea', label: 'アフタヌーンティー' },
    { id: 'massage', label: 'マッサージ' },
    { id: 'ramen', label: 'ラーメン' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        .tabs-container {
          background: #f3f4f6;
          padding: 4px;
          border-radius: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          position: relative;
          margin-bottom: 24px;
        }
        .tab {
          padding: 8px 16px;
          cursor: pointer;
          position: relative;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          border-radius: 12px;
          color: #6b7280;
          font-weight: 500;
          background: transparent;
          border: none;
          white-space: nowrap;
        }
        .tab.active {
          background: white;
          color: #16a34a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .tab:hover:not(.active) {
          color: #374151;
        }

        .currency-tabs-container {
          background: #f3f4f6;
          padding: 4px;
          border-radius: 12px;
          display: inline-flex;
          gap: 4px;
          position: relative;
        }
        .currency-tab {
          padding: 8px 16px;
          cursor: pointer;
          position: relative;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          border-radius: 8px;
          color: #6b7280;
          font-weight: 500;
          background: transparent;
          border: none;
          white-space: nowrap;
        }
        .currency-tab.active {
          background: white;
          color: #16a34a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .currency-tab:hover:not(.active) {
          color: #374151;
        }

        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .glow-lamp-effect {
          animation: glow 2s ease-in-out infinite;
          font-family: 'Inter', sans-serif;
        }
        body {
          padding-top: 64px;
        }
        .sticky {
          position: sticky;
          align-self: flex-start;
        }
        .font-bold {
          font-weight: 700 !important;
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <Image
            src="/lifesupport-hongkong-logo.png"
            alt="LIFESUPPORT HONGKONG Logo"
            width={80}
            height={80}
            className="rounded-full mr-4"
          />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">
            香港旅行・ライフのお悩みここでワンストップ解消！ | 香港LIFESUPPORT
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <AdSpace className="h-20" isTop={true} />
          </div>

          <div className="flex gap-8 items-start">
            <div className="flex-grow">
              <Card>
                <CardContent className="p-4">
                  <div className="tabs-container">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'exchange' && (
                    <>
                      <div className="border-y border-gray-200">
                        <nav className="flex items-center justify-between py-2" aria-label="Tabs">
                          <div className="currency-tabs-container">
                            {currencyPairs.map((pair) => (
                              <button
                                key={pair.id}
                                onClick={() => {
                                  setActiveCurrency(pair.base)
                                  fetchData(pair.base)
                                }}
                                className={`currency-tab ${
                                  activeCurrency === pair.base ? 'active' : ''
                                }`}
                              >
                                {pair.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleSort('buyRate')}
                              className="flex items-center"
                            >
                              買いレート
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 ml-2"
                              >
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                              </svg>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSort('sellRate')}
                              className="flex items-center"
                            >
                              売りレート
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 ml-2"
                              >
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                              </svg>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSort('area')}
                              className="flex items-center"
                            >
                              地域
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 ml-2"
                              >
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                              </svg>
                            </Button>
                          </div>
                        </nav>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-md border overflow-x-auto">
                          {loading ? (
                            <div className="p-4 text-center">データを読み込み中...</div>
                          ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                  <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                      <TableHead key={header.id} className="font-bold">
                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                            )}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableHeader>
                              <TableBody>
                                {table.getRowModel().rows.length ? (
                                  <>
                                    {table.getRowModel().rows.map((row, index) => (
                                      <React.Fragment key={row.id}>
                                        {index === 4 && (
                                          <TableRow>
                                            <TableCell colSpan={columns.length}>
                                              <AdSpace />
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        <TableRow>
                                          {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      </React.Fragment>
                                    ))}

                                    <TableRow className="bg-gray-100">
                                      <TableCell colSpan={columns.length} className="font-bold">銀行</TableCell>
                                    </TableRow>
                                    {data
                                      .filter(item => item.type === 'bank')
                                      .map(item => (
                                        <TableRow key={item.store}>
                                          <TableCell>{item.store}</TableCell>
                                          <TableCell className="text-right">{item.buyRate?.toFixed(4) ?? 'N/A'}</TableCell>
                                          <TableCell className="text-right">{item.sellRate?.toFixed(4) ?? 'N/A'}</TableCell>
                                          <TableCell>{item.updateTime}</TableCell>
                                          <TableCell>{item.area}</TableCell>
                                          <TableCell>
                                            <Button
                                              onClick={() => setSelectedStore(item)}
                                              variant="outline"
                                            >
                                              地図を見る
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}

                                    <TableRow className="bg-gray-100">
                                      <TableCell colSpan={columns.length} className="font-bold">クレジットカード</TableCell>
                                    </TableRow>
                                    {data
                                      .filter(item => item.type === 'creditCard')
                                      .map(item => (
                                        <TableRow key={item.store}>
                                          <TableCell>{item.store}</TableCell>
                                          <TableCell className="text-right">{item.buyRate?.toFixed(4) ?? 'N/A'}</TableCell>
                                          <TableCell className="text-right">{item.sellRate?.toFixed(4) ?? 'N/A'}</TableCell>
                                          <TableCell>{item.updateTime}</TableCell>
                                          <TableCell>{item.area}</TableCell>
                                          <TableCell>
                                            <Button
                                              onClick={() => setSelectedStore(item)}
                                              variant="outline"
                                            >
                                              地図を見る
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                  </>
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                      データがありません。再度お試しください。
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'hotel' && (
                    <div className="space-y-4">
                      <div className="rounded-md border overflow-x-auto">
                        {loading ? (
                          <div className="p-4 text-center">データを読み込み中...</div>
                        ) : error ? (
                          <div className="p-4 text-center text-red-500">{error}</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                  {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-bold">
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              ))}
                            </TableHeader>
                            <TableBody>
                              {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                  <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                      <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={hotelColumns.length} className="h-24 text-center">
                                    データがありません。再度お試しください。
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab !== 'exchange' && activeTab !== 'hotel' && (
                    <div className="p-4 text-center">
                      このタブの内容は現在準備中です。
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="w-1/3 min-h-[600px] sticky top-[144px]">
              <Map
                exchangeRates={data}
                selectedStore={selectedStore}
              />
              {selectedStore && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <h3 className="font-bold mb-2">{selectedStore.store}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedStore.address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>買いレート: {selectedStore.buyRate?.toFixed(4) ?? 'N/A'}</div>
                    <div>売りレート: {selectedStore.sellRate?.toFixed(4) ?? 'N/A'}</div>
                    <div className="col-span-2">更新時間: {selectedStore.updateTime}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <AdSpace className="h-20" />
          </div>
        </div>
      </main>
    </div>
  )
}