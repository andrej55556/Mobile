using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Forms;
using TriadCompiler;

namespace TriadPad
    {

    /// <summary>
    /// ����� ��� ����� ���� �� RichEdit
    /// </summary>
    public class InputRichEdit : Input
        {
        /// <summary>
        /// 	<para> ����������� ������ <see cref="InputRichEdit"/> .</para>
        /// </summary>
        /// <param Name="textBox"> ������� ������ ���� ������
        /// </param>
        /// <exception cref="ArgumentNullException">
        /// 	<para>�������� ��������� <paramref Name="textBox"/> ����� <langword Name="null"/>.</para>
        /// </exception>
        public InputRichEdit( RichTextBox textBox )
            {
            if ( textBox == null )
                throw new ArgumentNullException( "textBox" );

            this.textBox = textBox;
            }


        /// <summary>
        /// ���������� ������
        /// </summary>
        /// <returns>����������� ������ (null, ���� ������ ������)</returns>
        public override string GetLine()
            {
            if ( nextLineNumber < textBox.Lines.Length )
                {
                nextLineNumber++;
                return textBox.Lines[ nextLineNumber - 1 ];
                }
            else
                return null;
            }



        /// <summary>
        /// �������� �������
        /// </summary>
        private RichTextBox textBox;

        /// <summary>
        /// ����� ������ ��� ���������� ������
        /// </summary>
        private uint nextLineNumber = 0;
        }

    /// <summary>
    /// ����� ��� ������ ���� � RichEdit
    /// </summary>
    public class OutputRichEdit : Output
        {
        /// <summary>
        /// 	<para> ����������� ������ <see cref="OutputRichEdit"/> .</para>
        /// </summary>
        /// <param Name="textBox">
        /// </param>
        /// <exception cref="ArgumentNullException">
        /// 	<para>�������� ��������� <paramref Name="textBox"/> ����� <langword Name="null"/>.</para>
        /// </exception>
        public OutputRichEdit( RichTextBox textBox )
            {
            if ( textBox == null )
                throw new ArgumentNullException( "textBox" );

            this.textBox = textBox;
            textBox.Clear();
            }

        /// <summary>
        /// ������� ������� ��� �������� ������
        /// </summary>
        /// <param Name="line">��������� ������</param>
        /// <exception cref="ArgumentNullException">
        /// 	<para>�������� ��������� <paramref Name="line"/> ����� <langword Name="null"/>.</para>
        /// </exception>
        public override void Print( string line )
            {
            if ( line == null )
                throw new ArgumentNullException( "line" );

            textBox.AppendText( line );
            }

        /// <summary>
        /// ������� �������
        /// </summary>
        /// <param Name="line">��������� ������</param>
        /// <exception cref="ArgumentNullException">
        /// 	<para>�������� ��������� <paramref Name="line"/> ����� <langword Name="null"/>.</para>
        /// </exception>
        public override void PrintLine( string line )
            {
            if ( line == null )
                throw new ArgumentNullException( "line" );

            if ( textBox.Lines.Length != 0 )
                line = "\n" + line;

            textBox.AppendText( line );
            }

        /// <summary>
        /// ������� ��� ������
        /// </summary>
        private RichTextBox textBox;
        }


    /// <summary>
    /// �������� ��������� ������
    /// </summary>
    public class ErrorDescription
        {
        /// <summary>
        /// ����������� ������
        /// </summary>
        /// <param name="message">����� ���������</param>
        /// <param name="lineNumber">����� ������ � �������</param>
        /// <param name="chNumber">����� �������, ��� �������� ������</param>
        public ErrorDescription( string message, int lineNumber, int chNumber )
            {
            if ( message == null )
                throw new ArgumentNullException( "message" );

            this.message = message;
            this._lineNumber = lineNumber;
            this._chNumber = chNumber;
            }

        /// <summary>
        /// ����� ���������
        /// </summary>
        private string message;
        /// <summary>
        /// ����� ������ � �������
        /// </summary>
        private int _lineNumber;
        /// <summary>
        /// ����� �������, ��� �������� ������
        /// </summary>
        private int _chNumber;

        /// <summary>
        /// ����� ������ � �������
        /// </summary>
        public int lineNumber
            {
            get
                {
                return _lineNumber; 
                }
            }

        /// <summary>
        /// ����� �������, ��� �������� ������
        /// </summary>
        public int chNumber
            {
            get
                {
                return _chNumber;
                }
            }


        /// <summary>
        /// ��������� �������������
        /// </summary>
        /// <returns></returns>
        public override string ToString()
            {
            return message;
            }
        }


    /// <summary>
    /// ����� ��� ����������� ������ ������ � ���� �� �������������
    /// </summary>
    public class IOErrorListener : IOListing
        {
        /// <summary>
        /// 	<para> ����������� ������ <see cref="IOErrorListener"/> .</para>
        /// </summary>
        /// <param Name="input"> �������� ����
        /// </param>
        /// <param Name="output"> �������� ��������
        /// </param>
        public IOErrorListener( Input input, Output output )
            : base( input, output )
            {
            }

        /// <summary>
        /// ����� ������
        /// </summary>
        /// <param Name="message">����� ���������</param>
        /// <exception cref="ArgumentNullException">
        /// 	<para>�������� ��������� <paramref Name="message"/> ����� <langword Name="null"/>.</para>
        /// </exception>
        public override void ShowError( string message )
            {
            if ( message == null )
                throw new ArgumentNullException( "message" );

            ErrorDescription error = new ErrorDescription( message, this.lineNumber, this.linePosition ); ;
            registeredErrors.Add( error );
            base.ShowError( message );
            }

        /// <summary>
        /// �������� ������������������ ������
        /// </summary>
        /// <returns>������ �������� ������</returns>
        public ErrorDescription[] getRegisteredErrors()
            {
            ErrorDescription[] resultList = new ErrorDescription[ registeredErrors.Count ];
            registeredErrors.CopyTo( resultList );
            return resultList;
            }

        /// <summary>
        /// ������ ������������������ ������
        /// </summary>
        private List<ErrorDescription> registeredErrors = new List<ErrorDescription>();
        }

    }
