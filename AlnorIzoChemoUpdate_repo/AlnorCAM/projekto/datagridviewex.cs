using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Forms;

namespace WindowsApplication1
{
    public class datagridviewex : DataGridView
    {
        public delegate void MouseUpWheel();
        public event MouseUpWheel OnUpWheel;
        public delegate void MouseDownWheel();
        public event MouseDownWheel OnDownWheel;


        protected override void OnMouseWheel(MouseEventArgs e)
        {
            if (e.Delta > 0)
            {
                if (OnUpWheel != null)
                    OnUpWheel();
            }
            if (e.Delta < 0)
            {
                if (OnDownWheel != null)
                    OnDownWheel();
            }

            base.OnMouseWheel(e);
        }
    }
}
