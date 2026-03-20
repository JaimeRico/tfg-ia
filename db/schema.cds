namespace tfg;
using {cuid, managed} from '@sap/cds/common';

/*entity Greeting{
    key ID : Integer;
    message : String;
}*/

type Priority : String enum {
    high;
    medium;
    low;
}

type TicketType : String enum {
    Incident;
    Request;
    Change;
    Problem;
}

type Queue : String enum {
    TechnicalSupport    = 'Technical Support';
    CustomerService     = 'Customer Service';
    ITSupport           = 'IT Support';
    ProductSupport      = 'Product Support';
    BillingAndPayments  = 'Billing and Payments';
    ServiceOutages      = 'Service Outages and Maintenance';
    GeneralInquiry      = 'General Inquiry';
    ReturnsAndExchanges = 'Returns and Exchanges';
    SalesAndPreSales    = 'Sales and Pre-Sales';
    HumanResources      = 'Human Resources';
}

entity Incidencias : cuid, managed {
    subject      : String(500);
    body         : LargeString;
    priority     : Priority;
    type         : TicketType;
    queue        : Queue;
    language     : String(5);
    status       : String enum { nuevo; asignado; en_progreso; cerrado; } default 'nuevo';
    ai_suggested : Boolean default false;
    ai_confidence: Decimal(4,3);
}