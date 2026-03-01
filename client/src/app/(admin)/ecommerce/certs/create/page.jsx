import { Card, CardBody, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import CreateCertForms from './components/CreateCertForms'
import PageMetaData from '@/components/PageTitle'

const CreateCert = () => {
  return (
    <>
      <PageBreadcrumb title="Create Cert" subName="Edvisors" />
      <PageMetaData title="Create Cert" />

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
