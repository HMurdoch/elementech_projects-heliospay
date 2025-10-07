import React, {useEffect, useState} from 'react'
import axios from 'axios'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function App(){
  const [accounts,setAccounts]=useState([])
  const [tx,setTx]=useState([])
  const [selected,setSelected]=useState('')
  useEffect(()=>{ axios.get(`${API}/api/Accounts`).then(r=>setAccounts(r.data)) },[])
  useEffect(()=>{
    const url = selected?`${API}/api/Transactions?accountId=${selected}`:`${API}/api/Transactions`
    axios.get(url).then(r=>setTx(r.data))
  },[selected])
  const [amount,setAmount]=useState(10); const [type,setType]=useState('Credit'); const [desc,setDesc]=useState('Demo txn')
  const submit=async e=>{
    e.preventDefault()
    if(!selected) return alert('choose account')
    await axios.post(`${API}/api/Transactions`,{accountId:selected,amount:parseFloat(amount),type,description:desc})
    const r=await axios.get(`${API}/api/Transactions?accountId=${selected}`); setTx(r.data)
  }
  return (<div style={{fontFamily:'system-ui',color:'#e6f6ff',background:'#0b1116',minHeight:'100vh',padding:'20px'}}>
    <h1>HeliosPay – Demo</h1>
    <p>POST transactions (Credit=positive, Debit=negative) and see state update.</p>
    <label>Account: </label>
    <select value={selected} onChange={e=>setSelected(e.target.value)}>
      <option value="">(all)</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.owner} – {a.number} (bal: {a.balance})</option>)}
    </select>
    <form onSubmit={submit} style={{marginTop:'10px'}}>
      <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/>
      <select value={type} onChange={e=>setType(e.target.value)}><option>Credit</option><option>Debit</option></select>
      <input value={desc} onChange={e=>setDesc(e.target.value)}/><button>Add Tx</button>
    </form>
    <h3>Transactions</h3>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th align="left">Date</th><th align="left">Account</th><th align="left">Amount</th><th align="left">Type</th><th align="left">Description</th></tr></thead>
      <tbody>{tx.map(t=>(<tr key={t.id} style={{borderTop:'1px solid #123'}}>
        <td>{new Date(t.createdAt).toLocaleString()}</td>
        <td>{t.account?.owner}</td>
        <td>{t.amount}</td>
        <td>{t.type}</td>
        <td>{t.description}</td>
      </tr>))}</tbody>
    </table></div>)
}
