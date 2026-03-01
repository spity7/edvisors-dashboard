import { Card, CardBody, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import CreateCertForms from './components/CreateCertForms'
import PageMetaData from '@/components/PageTitle'

const CreateCert = () => {
  return (
    <>
      <PageBreadcrumb title="Create Certificate" subName="Edvisors" />
      <PageMetaData title="Create Certificate" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateCertForms />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
export default CreateCert
