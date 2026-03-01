import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGlobalContext } from '@/context/useGlobalContext'
import CertsListTable from './components/CertsListTable'

const CertsList = () => {
  const { getAllCerts } = useGlobalContext()
  const [certsList, setCertsList] = useState([])

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await getAllCerts()
        setCertsList(data)
      } catch (error) {
        console.error('Error fetching certs:', error)
      }
    }
    fetchCerts()
  }, [getAllCerts])

  return (
    <>
      <PageMetaData title="Certs List" />
      <PageBreadcrumb title="Certs List" subName="Edvisors" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                {/* <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input type="search" className="form-control" id="search" placeholder="Search ..." />
                </div> */}
                <div>
                  <Link to="/ecommerce/certs/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Create Cert
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>{certsList.length > 0 ? <CertsListTable certs={certsList} /> : <div className="text-center p-4">No Certs Found</div>}</div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CertsList
