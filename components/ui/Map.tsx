import React from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '600px'
}

const center = {
  lat: 22.3193, // 香港の緯度
  lng: 114.1694 // 香港の経度
}

function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center)
    map.fitBounds(bounds)
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      { /* 子要素、マーカーなどをここに追加 */ }
    </GoogleMap>
  ) : <></>
}

export default React.memo(Map)