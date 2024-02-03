import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { DecimalToBinary } from "@ilihub/decimal-to-binary";


export default function BinaryToDecimal() {
  const { colorMode } = useColorMode();

  const [result, setResult] = React.useState('11001000')
  const [decimal, setDecimal] = React.useState(0)


  return (
    <>
      <p> Geser Untuk Melihat Perubahan </p>
      <p>Decimal: {decimal} | Binary: {result.length > 8 ? '~': result}</p>
      <input min="200" max="250" value={decimal}  onChange={e => {
        setResult( DecimalToBinary(Number(e.target.value))?.split("").map(v => `  ${v}`) )
        setDecimal(Number(e.target.value))
      }} type="range" style={{height: 25, fontSize: 20}} />
    </> 
  )
}
