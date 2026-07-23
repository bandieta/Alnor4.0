using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace WindowsApplication1
{
    public partial class Info : Form, IMultiLang
    {
        public Info()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void Info_Load(object sender, EventArgs e)
        {

        }

        #region IMultiLang Members

        public void Translate(Dictionary<string, string> dict)
        {
            if (dict != null)
            foreach (string item in dict.Keys)
            { TryTranslate(item, dict[item]); }
        }

        private void TryTranslate(string from, string to)
        {
            this.Text = this.Text.Replace(from, to);
            button1.Text = button1.Text.Replace(from, to);
            label1.Text = label1.Text.Replace(from, to);
        }

        #endregion
    }
}