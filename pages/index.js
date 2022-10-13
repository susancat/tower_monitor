import axios from 'axios'


export default function Home(props) {
  console.log(props)
  return(
    <div style={{margin: '1rem'}}>
      <h1>{props.data}</h1>
    </div>
  )
}
export async function getServerSideProps() {
    const BASE_URL = process.env.BASE_URL
    const res = await axios.get(`${BASE_URL}/api/circulation`)
    const data = res.data
    return {
      props: {
        data
      }
    }
}