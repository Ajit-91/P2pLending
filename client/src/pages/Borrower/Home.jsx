import { Avatar, Box, Button, Grid, Paper, TableContainer, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import LenderCard from '../../components/Cards/LenderCard'
import DataTable from '../../components/DataTable'
import Layout from '../../components/Layout'
import Status from '../../components/Status'
import { useEth } from '../../contexts'
import { unixToUTCTimestamp } from '../../utils/dateTimeUtils'

const Home = () => {
  const { state: { contracts, accounts } } = useEth();
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    // fetch lenders requests
    (async () => {
      try {
        const reqDetails = await contracts['P2pLending'].methods.getBorrowerRequests().call({ from: accounts[0] });
        console.log(reqDetails);
        const arrObjs = reqDetails.map((req) => Object.assign({}, req));

        const allReqs = Promise.all(arrObjs.map(async (request) => {
          const borrower = await contracts['P2pLending'].methods.borrowers(request.from).call();
          return {
            ...request,
            borrowerImg: borrower.image,
            borrowerName: borrower.name,
          }
        }))

        const allRows = makeRows(await allReqs)
        setRows(allRows);
      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  const makeRows = (reqs) => reqs?.map((request) => {
    console.log({ request });
    return {
      Lender: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={request?.borrowerImg}
          />
          <Typography
            sx={{ ml: 3 }}
          >
            {request?.borrowerName}
          </Typography>
        </Box>
      ),
      Date: (
        <Typography>
          {new Date(unixToUTCTimestamp(request?.createdAt)).toDateString()}
        </Typography>
      ),
      Status: (
        <Status status={request?.status} />
      ),
      Action: (
        <Button
          variant='contained'
          onClick={() => navigate(`/borrower/request-details/${request?.id}`)}
        >Details
        </Button>
      ),
    }
  })

  return (

    <Layout>
      {
        rows && rows.length > 0 ? (
          <>
            <Typography align='center' sx={{ my: 4 }} variant="h5">Requests</Typography>

            <TableContainer component={Paper} elevation={3} >
              <DataTable rows={rows} />
            </TableContainer>
          </>
        ) : (
          <div className="d-flex w-100 h-100 justify-content-center align-items-center flex-column">
            <Typography align='center' sx={{ mt: 4 }} variant="h6">Currently you don't have made any loan request</Typography>
            <Typography align='center' variant="h6">Explore all Lenders and make a request</Typography>
            <Button variant='contained' onClick={() => navigate('/borrower/lenders')}>Explore</Button>
          </div>
        )
      }

    </Layout>
  )
}

export default Home