import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PoliticaDeReembolsosPage() {
    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 bg-white p-8 rounded-2xl shadow-sm">
                    <h1 className="text-3xl font-bold text-primary-500 mb-6">Política de Devoluciones y Reembolsos</h1>
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p>Última actualización: 09 de junio de 2026</p>
                        <p>Gracias por comprar en Servimos Norte.</p>
                        <p>Si por alguna razón no está completamente satisfecho con una compra, le invitamos a revisar nuestra política sobre reembolsos y devoluciones.</p>
                        <p>Los siguientes términos son aplicables para cualquier producto que nos haya comprado.</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Interpretación y Definiciones</h2>
                        <h3 className="text-xl font-semibold mt-6 mb-2">Interpretación</h3>
                        <p>Las palabras cuyas letras iniciales están en mayúscula tienen significados definidos bajo las siguientes condiciones. Las siguientes definiciones tendrán el mismo significado independientemente de si aparecen en singular o en plural.</p>

                        <h3 className="text-xl font-semibold mt-6 mb-2">Definiciones</h3>
                        <p>A los efectos de esta Política de Devoluciones y Reembolsos:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Compañía</strong> (referida como "la Compañía", "Nosotros", "Nos" o "Nuestro" en esta Política) se refiere a Servimos Norte SAS, Calle 142 #17a-05 Bogotá, Cedritos 110121.</li>
                            <li><strong>Bienes</strong> o <strong>Productos</strong> se refieren a los artículos ofrecidos para la venta en el Servicio.</li>
                            <li><strong>Pedidos</strong> significa una solicitud de Usted para comprar Bienes de Nosotros.</li>
                            <li><strong>Servicio</strong> se refiere al Sitio web.</li>
                            <li><strong>Sitio web</strong> se refiere a Servimos Norte, accesible desde <a href="https://servimosnorte.com/" className="text-accent-500 hover:underline">https://servimosnorte.com/</a>.</li>
                            <li><strong>Usted</strong> significa la persona que accede o utiliza el Servicio, o la empresa, u otra entidad legal en nombre de la cual dicha persona accede o utiliza el Servicio, según corresponda.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Sus Derechos de Cancelación de Pedidos</h2>
                        <p>Usted tiene derecho a cancelar su Pedido en un plazo de 7 días sin dar ningún motivo para hacerlo.</p>
                        <p>El plazo para cancelar un Pedido es de 7 días a partir de la fecha en que Usted recibió los Bienes o en la que un tercero designado por usted, que no sea el transportista, toma posesión del producto entregado.</p>
                        <p>Para ejercer su derecho de cancelación, debe informarnos de su decisión mediante una declaración clara. Puede informarnos de su decisión de las siguientes formas:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Por correo electrónico: servimosnorte@gmail.com</li>
                            <li>Visitando esta página en nuestro sitio web: <a href="https://servimosnorte.com/" className="text-accent-500 hover:underline">https://servimosnorte.com/</a></li>
                        </ul>
                        <p>Le reembolsaremos en un plazo máximo de 14 días a partir del día en que recibamos los Bienes devueltos. Utilizaremos el mismo medio de pago que utilizó para el Pedido y no incurrirá en ningún cargo por dicho reembolso.</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Condiciones para Devoluciones</h2>
                        <p>Para que los Bienes sean elegibles para una devolución, asegúrese de que:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Los Bienes se compraron en los últimos 7 días.</li>
                            <li>Los Bienes están en su embalaje original.</li>
                        </ul>
                        <p>Los siguientes Bienes no pueden ser devueltos:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>El suministro de Bienes hechos según sus especificaciones o claramente personalizados.</li>
                            <li>El suministro de Bienes que por su naturaleza no son aptos para ser devueltos, se deterioran rápidamente o cuya fecha de caducidad ha pasado.</li>
                            <li>El suministro de Bienes que no son aptos para devolución por razones de protección de la salud o higiene y fueron desprecintados después de la entrega.</li>
                            <li>El suministro de Bienes que, después de la entrega, según su naturaleza, se mezclan de forma inseparable con otros artículos.</li>
                        </ul>
                        <p>Nos reservamos el derecho de rechazar devoluciones de cualquier mercancía que no cumpla con las condiciones de devolución anteriores a nuestra entera discreción.</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Devolución de Bienes</h2>
                        <p>Usted es responsable del costo y riesgo de devolvernos los Bienes. Debe enviar los Bienes a la siguiente dirección:</p>
                        <p className="font-semibold">Calle 142 # 17a -05 Local 2</p>
                        <p>No nos hacemos responsables de los Bienes dañados o perdidos en el envío de devolución. Por lo tanto, recomendamos un servicio de correo asegurado y rastreable. No podemos emitir un reembolso sin la recepción real de los Bienes o el comprobante de entrega de devolución recibida.</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Regalos</h2>
                        <p>Si los Bienes fueron marcados como regalo al comprarlos y luego enviados directamente a usted, recibirá un crédito de regalo por el valor de su devolución. Una vez que se reciba el producto devuelto, se le enviará un certificado de regalo por correo.</p>
                        <p>Si los Bienes no fueron marcados como regalo al momento de la compra, o si el comprador del regalo se envió el Pedido a sí mismo para dárselo a usted más tarde, le enviaremos el reembolso al comprador del regalo.</p>

                        <h3 className="text-xl font-semibold mt-6 mb-2">Contáctenos</h3>
                        <p>Si tiene alguna pregunta sobre nuestra Política de Devoluciones y Reembolsos, contáctenos:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Por correo electrónico: servimosnorte@gmail.com</li>
                            <li>Visitando esta página en nuestro sitio web: <a href="https://servimosnorte.com/" className="text-accent-500 hover:underline">https://servimosnorte.com/</a></li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
