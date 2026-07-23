using System;
using System.Windows.Forms;
using System.Threading;
using System.Globalization;

namespace WindowsApplication1
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string [] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            Thread.CurrentThread.CurrentCulture = CultureInfo.InvariantCulture;

            loadingdialog l = new loadingdialog();
            l.Show();
            l.Update();


            //Thread t = new Thread(delegate()
            //{
            //    while (true)
            //    {

            //        l.Invoke(new MethodInvoker(delegate()
            //            {
            //                l.progressBar1.Value += 0;
            //                l.Refresh();
            //                Thread.Sleep(100);
            //            }));
            //    }
            //});
            //t.Priority = ThreadPriority.Highest;
            //t.Start();
            //Thread.Sleep(1000);

            Thread.CurrentThread.Priority = ThreadPriority.Highest;
            Application.Run(new Form1(args, l));
        }
    }
}