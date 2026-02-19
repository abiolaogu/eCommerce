import { Refine } from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import {
  CoverageLaneResponse,
  createFusionServiceAdapters,
  createOmniRouteClient,
  mapFusionOrderToPolicyRequest,
  PolicyCheckResponse,
} from "@fusioncommerce/omniroute-sdk";

const { Title, Text, Paragraph } = Typography;

type CheckoutLine = {
  sku: string;
  category: string;
  quantity: number;
  price: number;
};

const initialLines: CheckoutLine[] = [
  { sku: "IND-CHK-40", category: "Noodles", quantity: 10, price: 5500 },
  { sku: "PM-400-CTN", category: "Dairy", quantity: 8, price: 2800 },
];

const orderServiceUrl = import.meta.env.VITE_ORDERS_SERVICE_URL || "http://localhost:3001";
const shippingServiceUrl = import.meta.env.VITE_SHIPPING_SERVICE_URL || "http://localhost:3005";
const omnirouteBaseUrl = import.meta.env.VITE_OMNIROUTE_API_BASE_URL || "";
const omniroutePublicKey = import.meta.env.VITE_OMNIROUTE_PUBLIC_KEY || "";
const omnirouteTenantId = import.meta.env.VITE_OMNIROUTE_TENANT_ID || "";

export default function App() {
  const [form] = Form.useForm();
  const [sdkPreview, setSdkPreview] = useState<PolicyCheckResponse | null>(null);
  const [servicePreview, setServicePreview] = useState<PolicyCheckResponse | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Record<string, unknown> | null>(null);
  const [lanePreview, setLanePreview] = useState<CoverageLaneResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createTenantAwareSdkClient = (tenantId?: string) => {
    if (!omnirouteBaseUrl || !omniroutePublicKey) {
      return null;
    }

    return createOmniRouteClient({
      baseUrl: omnirouteBaseUrl,
      apiKey: omniroutePublicKey,
      tenantId: tenantId || omnirouteTenantId || undefined,
    });
  };

  const serviceAdapters = useMemo(() => {
    return createFusionServiceAdapters({
      ordersServiceUrl: orderServiceUrl,
      shippingServiceUrl: shippingServiceUrl,
    });
  }, []);

  const lines: CheckoutLine[] = Form.useWatch("lines", form) ?? initialLines;

  const normalizedLines = (input: CheckoutLine[]) => {
    return input.map((line) => ({
      sku: line.sku,
      category: line.category,
      quantity: Number(line.quantity),
      price: Number(line.price),
    }));
  };

  const runAction = async (handler: () => Promise<void>) => {
    setErrorMessage(null);
    try {
      await handler();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
    }
  };

  const evaluateWithSdk = async () => {
    await runAction(async () => {
      const values = await form.validateFields();
      const sdkClient = createTenantAwareSdkClient(values.tenantId);
      if (!sdkClient) {
        throw new Error("Set VITE_OMNIROUTE_API_BASE_URL and VITE_OMNIROUTE_PUBLIC_KEY to use direct SDK preview.");
      }

      const result = await sdkClient.evaluateCheckoutPolicy(
        mapFusionOrderToPolicyRequest({
          brandId: values.brandId,
          destinationState: values.destinationState,
          items: normalizedLines(values.lines).map((line) => ({
            sku: line.sku,
            category: line.category,
            quantity: line.quantity,
          })),
        }),
      );
      setSdkPreview(result);
    });
  };

  const evaluateViaOrdersService = async () => {
    await runAction(async () => {
      const values = await form.validateFields();
      const payload = await serviceAdapters.previewPolicy({
        tenantId: values.tenantId,
        brandId: values.brandId,
        destinationState: values.destinationState,
        items: normalizedLines(values.lines).map((line) => ({
          sku: line.sku,
          category: line.category,
          quantity: line.quantity,
        })),
      });
      setServicePreview(payload);
    });
  };

  const createOrder = async () => {
    await runAction(async () => {
      const values = await form.validateFields();
      const order = await serviceAdapters.createOrder({
        customerId: values.customerId,
        tenantId: values.tenantId,
        brandId: values.brandId,
        destinationState: values.destinationState,
        currency: values.currency,
        items: normalizedLines(values.lines),
      });
      setCreatedOrder(order);
    });
  };

  const previewShippingLanes = async () => {
    await runAction(async () => {
      const values = await form.validateFields(["destinationState"]);
      const lanes = await serviceAdapters.previewShippingLanes(values.destinationState);
      setLanePreview(lanes);
    });
  };

  return (
    <Refine
      dataProvider={dataProvider}
      authProvider={authProvider}
      resources={[{ name: "users" }, { name: "organizations" }, { name: "projects" }]}
    >
      <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
        <Card
          style={{
            marginBottom: 16,
            background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)",
            border: "none",
          }}
        >
          <Title level={2} style={{ color: "white", margin: 0 }}>
            FusionCommerce x OmniRoute Checkout Orchestration
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.85)", marginBottom: 0 }}>
            Frontend now exercises the same OmniRoute SDK directly and through service-backed endpoints for production-safe flows.
          </Paragraph>
        </Card>

        {errorMessage && (
          <Alert
            style={{ marginBottom: 16 }}
            type="error"
            message="Request failed"
            description={errorMessage}
            showIcon
          />
        )}

        <Card title="Checkout Context" style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              tenantId: "tenant_acme_001",
              customerId: "customer-123",
              brandId: "indomie",
              destinationState: "Lagos",
              currency: "USD",
              lines: initialLines,
            }}
          >
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item name="tenantId" label="Tenant ID" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="customerId" label="Customer ID" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item name="brandId" label="Brand" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item name="destinationState" label="Destination State" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Line Items</Divider>
            <Form.List name="lines">
              {(fields: Array<{ key: string | number; name: number }>) => (
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fields.map((field: { key: string | number; name: number }) => (
                    <Row gutter={12} key={field.key}>
                      <Col xs={24} md={6}>
                        <Form.Item name={[field.name, "sku"]} label="SKU" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name={[field.name, "category"]} label="Category" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name={[field.name, "quantity"]} label="Quantity" rules={[{ required: true }]}>
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name={[field.name, "price"]} label="Price" rules={[{ required: true }]}>
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </Space>
              )}
            </Form.List>

            <Space wrap>
              <Button type="primary" onClick={evaluateWithSdk}>
                Direct SDK Policy Preview
              </Button>
              <Button onClick={evaluateViaOrdersService}>Orders Service Policy Preview</Button>
              <Button onClick={createOrder}>Create Order (Policy-Aware)</Button>
              <Button onClick={previewShippingLanes}>Shipping Lane Preview</Button>
            </Space>
          </Form>
        </Card>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title="Direct SDK Output"
              extra={<Tag color={sdkPreview?.compliant ? "success" : "warning"}>{sdkPreview ? (sdkPreview.compliant ? "COMPLIANT" : "AUTO-GROUP") : "IDLE"}</Tag>}
            >
              {sdkPreview ? (
                <>
                  <Text strong>{sdkPreview.coverageLane}</Text>
                  <br />
                  <Text type="secondary">SLA: {sdkPreview.expectedSlaHours}h</Text>
                  <Table<{ category: string; quantity: number; requiredMOQ: number; compliant: boolean }>
                    style={{ marginTop: 12 }}
                    size="small"
                    pagination={false}
                    rowKey={(row) => row.category}
                    dataSource={sdkPreview.checks}
                    columns={[
                      { title: "Category", dataIndex: "category" },
                      { title: "Qty", dataIndex: "quantity", align: "right" },
                      { title: "MOQ", dataIndex: "requiredMOQ", align: "right" },
                      { title: "Status", dataIndex: "compliant", render: (value: boolean) => <Tag color={value ? "success" : "warning"}>{value ? "OK" : "GAP"}</Tag> },
                    ]}
                  />
                </>
              ) : (
                <Text type="secondary">No direct SDK evaluation yet.</Text>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Service-Orchestrated Output">
              {servicePreview ? (
                <>
                  <Text strong>{servicePreview.coverageLane}</Text>
                  <br />
                  <Text type="secondary">SLA: {servicePreview.expectedSlaHours}h</Text>
                </>
              ) : (
                <Text type="secondary">No service policy preview yet.</Text>
              )}

              <Divider />

              {createdOrder ? (
                <>
                  <Text strong>Latest Order</Text>
                  <pre style={{ marginTop: 8, overflowX: "auto" }}>{JSON.stringify(createdOrder, null, 2)}</pre>
                </>
              ) : (
                <Text type="secondary">No order created in this session.</Text>
              )}

              <Divider />

              {lanePreview.length > 0 ? (
                <Table<CoverageLaneResponse>
                  size="small"
                  pagination={false}
                  rowKey={(row) => row.laneId}
                  dataSource={lanePreview}
                  columns={[
                    { title: "Lane", dataIndex: "laneId" },
                    { title: "Owner", dataIndex: "owner" },
                    { title: "Type", dataIndex: "ownerType" },
                    { title: "SLA (h)", dataIndex: "slaHours", align: "right" },
                  ]}
                />
              ) : (
                <Text type="secondary">No shipping lane preview yet.</Text>
              )}
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 16 }} title="Current Checkout Basket">
          <Table<CheckoutLine>
            size="small"
            pagination={false}
            rowKey={(row) => `${row.sku}-${row.category}`}
            dataSource={lines}
            columns={[
              { title: "SKU", dataIndex: "sku" },
              { title: "Category", dataIndex: "category" },
              { title: "Qty", dataIndex: "quantity", align: "right" },
              { title: "Price", dataIndex: "price", align: "right" },
            ]}
          />
        </Card>
      </div>
    </Refine>
  );
}
